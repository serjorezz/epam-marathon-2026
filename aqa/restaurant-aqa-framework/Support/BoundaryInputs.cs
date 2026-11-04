namespace Restaurant_Aqa_Framework.Support;

/// <summary>
/// Valid values built to exact lengths — the boundary counterparts of <see cref="InvalidInputs"/>.
/// Every value satisfies both the backend's validation rules and the account store's password
/// policy, so a registration with one of them succeeds exactly when the boundary is accepted.
/// </summary>
public static class BoundaryInputs
{
    public const int MinNameLength = 2;
    public const int MaxNameLength = 50;
    public const int MinPasswordLength = 8;
    public const int MaxPasswordLength = 16;

    /// <summary>The homework's documented ceiling for an email address.</summary>
    public const int MaxEmailLength = 254;

    /// <summary>The deployed account store (Cognito) caps the username — which registration copies
    /// the email address into — at 128 characters, so this is the longest email that can actually
    /// be registered, even though the backend's own validation accepts up to 254.</summary>
    public const int MaxAcceptedEmailLength = 128;

    private const string ExampleDomain = "@example.com";

    /// <summary>Latin letters only, so the name also passes the character rule at any length.</summary>
    public static string NameOfLength(int length) => new('a', length);

    /// <summary>Upper, lower, digit and symbol up front, so the account store's password policy is met at any length ≥ 4.</summary>
    public static string PasswordOfLength(int length) => "Aa1!" + new string('a', length - 4);

    /// <summary>A syntactically valid address of exactly <paramref name="length"/> characters: a long
    /// local part in front of a fixed short domain.</summary>
    public static string EmailOfLength(int length) => new string('a', length - ExampleDomain.Length) + ExampleDomain;
}
