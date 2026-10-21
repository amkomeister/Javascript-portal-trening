export const files = (js = '', html = '', css = '') => ({ js, html, css });
export function make(module, rows, mode = 'draw') {
  return rows.map((r, i) => ({
    id: 'skule-v1-' + module + '-' + String(i + 1).padStart(2, '0'),
    module,
    number: i + 1,
    mode,
    title: r.title,
    goal: r.goal,
    explain: r.explain,
    glossary: Object.fromEntries([r.term]),
    example: r.example || r.solution.split('\n').slice(0, 3).join('\n'),
    starter: files(r.start, r.html || '', r.css || ''),
    solution: files(r.solution, r.solutionHtml ?? r.html ?? '', r.solutionCss ?? r.css ?? ''),
    hints: r.hints,
    solutionExplanation: r.why,
    extension: r.extra,
    selfCheck:
      r.self ||
      'Forklar med eigne ord kva du endra, og kvifor resultatet blei slik. Prøv òg ein annan verdi.',
    check: r.check,
    projectKey: r.projectKey || null,
  }));
}
