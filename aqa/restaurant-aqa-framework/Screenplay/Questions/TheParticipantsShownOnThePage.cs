using System.Text.RegularExpressions;
using Microsoft.Playwright;
using Restaurant_Aqa_Framework.Ui;

namespace Restaurant_Aqa_Framework.Screenplay.Questions;

public sealed record ParticipantSummary(string Name, string Status, decimal Total, int ItemCount);

/// <summary>The participant cards currently rendered on the owner's group pre-order page.</summary>
public sealed class TheParticipantsShownOnThePage : IQuestion<IReadOnlyList<ParticipantSummary>>
{
    public async Task<IReadOnlyList<ParticipantSummary>> AnsweredByAsync(Actor actor)
    {
        var page = new GroupOrderPage(actor.LookingAtThePage());
        await page.WaitForReadyAsync();
        var count = await page.ParticipantCards.CountAsync();
        var result = new List<ParticipantSummary>();
        for (var i = 0; i < count; i++)
        {
            var card = page.Participant(i);
            // The deployed card titles are prefixed ("Guest: Alice", "Owner: Alice"); assertions
            // work with the bare participant name.
            var rawName = (await card.Name.TextContentAsync() ?? "").Trim();
            var name = rawName.Contains(": ") ? rawName[(rawName.IndexOf(": ", StringComparison.Ordinal) + 2)..] : rawName;
            var status = await card.SubmittedChip.IsVisibleAsync() ? "Submitted"
                : await card.PendingChip.IsVisibleAsync() ? "Still choosing" : "None";
            var totalText = ((await card.Subtotal.TextContentAsync()) ?? "").Trim();
            var totalMatch = Regex.Match(totalText, @"[\d]+(?:[.,]\d+)?");
            var total = totalMatch.Success
                ? decimal.Parse(totalMatch.Value.Replace(',', '.'), System.Globalization.CultureInfo.InvariantCulture)
                : 0m;
            result.Add(new ParticipantSummary(name, status, total, await card.Items.CountAsync()));
        }
        return result;
    }
}
