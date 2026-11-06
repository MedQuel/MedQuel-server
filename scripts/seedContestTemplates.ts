import { FieldValue } from 'firebase-admin/firestore';

import { db } from '../src/config/firebase.js';
import { TEMPLATES, RETIRED_TEMPLATE_IDS, validateTemplates } from './contestTemplateDefinitions.js';


async function seed(): Promise<void> {
  const problems = validateTemplates();
  if (problems.length > 0) {
    console.error('Template definitions have problems, nothing was written:\n - ' + problems.join('\n - '));
    process.exit(1);
  }

  const collection = db.collection('contestTemplates');

  for (const id of RETIRED_TEMPLATE_IDS) {
    const ref = collection.doc(id);
    if ((await ref.get()).exists) {
      await ref.update({
        isActive: false,
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`Retired: ${id}`);
    }
  }

  for (const [slug, template] of Object.entries(TEMPLATES)) {
    const ref = collection.doc(slug);
    const existing = await ref.get();

    const optionalFields = {
      perSubject: template.perSubject ?? FieldValue.delete(),
      runAtHoursIST: template.runAtHoursIST ?? FieldValue.delete(),
    };

    if (existing.exists) {
      await ref.update({
        ...template,
        ...optionalFields,
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`Updated: ${slug}`);
    } else {
      await ref.set({
        ...template,
        templateId: slug,
        lastGeneratedAt: null,
        subjectQueue: [],
        createdBy: 'seed-script',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`Created: ${slug}`);
    }
  }

  console.log(`Done — ${Object.keys(TEMPLATES).length} templates in sync, ${RETIRED_TEMPLATE_IDS.length} retired ids checked.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
