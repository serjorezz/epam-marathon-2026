import { Pipe, PipeTransform, inject } from "@angular/core";
import { TranslationService } from "@app/services/translation/translation.service";

@Pipe({
  name: "translate",
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);

  transform(value: string | undefined | null): string {
    if (!value) return "";
    return this.translationService.translate(value);
  }
}
