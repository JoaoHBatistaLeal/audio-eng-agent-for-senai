import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Pipe({
  name: 'markdownToHtml',
  standalone: true
})
export class MarkdownToHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): SafeHtml {
    if (!value) {
      return '';
    }

    let rawHtml = marked.parse(value, {
      gfm: true,
      breaks: true
    }) as string;

    rawHtml = rawHtml.replace(/<table(\s*|>)/g, '<div class="table-wrapper"><table$1').replace(/<\/table>/g, '</table></div>');

    return this.sanitizer.bypassSecurityTrustHtml(rawHtml);
  }
}
