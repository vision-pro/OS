import { writeFile } from 'node:fs/promises';

const [outputPath, projectId] = process.argv.slice(2);
if (!outputPath || !projectId) {
  throw new Error('Expected: <outputPath> <projectId>');
}

const services = [
  ['cinematic-advertising', 'إعلانات سينمائية', 'Cinematic Advertising', 'من الفكرة إلى المونتاج، نصنع إعلاناً يحضر في الذاكرة.', 'From concept to edit, we create advertising that stays with the audience.', 'نحوّل رسالتك إلى تجربة بصرية متقنة تجمع الفكرة، الإخراج، التصوير، وما بعد الإنتاج.', 'We turn your message into a precise visual experience spanning concept, direction, production, and post-production.', 'Clapperboard', 1],
  ['visual-identity', 'هوية بصرية', 'Visual Identity', 'هوية واضحة وجريئة تمنح العلامة حضوراً لا يُنسى.', 'Clear, bold identities that give brands an unmistakable presence.', 'نبني نظاماً بصرياً متماسكاً يترجم شخصيّة العلامة إلى تفاصيل قابلة للتطبيق.', 'We build cohesive visual systems that translate brand character into repeatable detail.', 'Palette', 2],
  ['event-production', 'إنتاج فعاليات', 'Event Production', 'تغطية وإخراج يلتقطان اللحظة ويمنحانها امتداداً.', 'Coverage and direction that capture the moment and extend its impact.', 'نرافق الحدث من التخطيط وحتى تسليم المحتوى، بإيقاع بصري يحترم قيمة التجربة.', 'We support events from planning through delivery with a visual rhythm worthy of the experience.', 'Sparkles', 3],
  ['ai-content', 'محتوى بالذكاء الاصطناعي', 'AI-Assisted Content', 'أدوات ذكية في خدمة فكرة إنسانية أصيلة.', 'Intelligent tools in service of an original human idea.', 'نستخدم تقنيات الذكاء الاصطناعي لتعزيز سرعة التصور وتوسيع احتمالات الحكاية البصرية.', 'We use AI techniques to accelerate ideation and expand the possibilities of visual storytelling.', 'WandSparkles', 4],
];

const clients = [
  ['زلال', 'Zulal', 1],
  ['ماس', 'MAS', 2],
  ['أحمد', 'Ahmed', 3],
  ['أبراج', 'Abraj', 4],
];

const quote = value => `'${String(value).replaceAll("'", "''")}'`;
const serviceValues = services.map(row => `(${row.map(quote).join(', ')}, true)`).join(',\n');
const clientValues = clients.map(row => `(${row.map(quote).join(', ')}, true)`).join(',\n');

const query = `
insert into public.services (slug, title_ar, title_en, summary_ar, summary_en, description_ar, description_en, icon, sort_order, is_active)
values ${serviceValues}
on conflict (slug) do update set
  title_ar = excluded.title_ar, title_en = excluded.title_en, summary_ar = excluded.summary_ar,
  summary_en = excluded.summary_en, description_ar = excluded.description_ar, description_en = excluded.description_en,
  icon = excluded.icon, sort_order = excluded.sort_order, is_active = excluded.is_active;

insert into public.clients (name_ar, name_en, sort_order, is_active)
values ${clientValues}
on conflict do nothing;
`;

await writeFile(outputPath, JSON.stringify({ project_id: projectId, query }));
