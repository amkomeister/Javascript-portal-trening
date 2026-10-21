export function checkMarkup(lesson, files, Parser = DOMParser) {
  const d = new Parser().parseFromString(files.html, 'text/html');
  // These are illustrative learning checks, never authorization or teacher grades.
  const css = files.css.replace(/\/\*[\s\S]*?\*\//g, '');
  return (
    (!lesson.check.html || !!lesson.check.html(d)) && (!lesson.check.css || !!lesson.check.css(css))
  );
}
export async function checkLesson(lesson, files, r, clean, Parser) {
  const initial = r.run(files.js);
  if (initial.error) return { passed: false, error: initial.error };
  let passed = Parser ? checkMarkup(lesson, files, Parser) : clean.markupPassed !== false;
  for (const step of lesson.check.steps || []) {
    const out = step.event ? r.event(step.event) : r.tick(step.tick);
    if (out.error) return { passed: false, error: out.error };
    if (step.expect && !step.expect(r.snapshot())) passed = false;
  }
  if (lesson.check.expression && r.read(lesson.check.expression) !== true) passed = false;
  if (lesson.check.inspect && !lesson.check.inspect(r.snapshot())) passed = false;
  return { passed: lesson.check.manual ? null : passed, error: '' };
}
