import React from 'react';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

export type SubjectVariant =
  | 'error'
  | 'accent'
  | 'success'
  | 'premium'
  | 'warning';

export type SubjectId =
  | 'anatomy'
  | 'biochemistry'
  | 'physiology'
  | 'microbiology'
  | 'pharmacology'
  | 'forensic_medicine'
  | 'pathology'
  | 'ophthalmology'
  | 'ent'
  | 'community_medicine'
  | 'medicine'
  | 'surgery'
  | 'pediatrics'
  | 'gynae_obstetrics'
  | 'orthopedics'
  | 'dermatology'
  | 'psychiatry'
  | 'anesthesia'
  | 'radiology';

export type SubjectIconKey =
  | 'anatomy'
  | 'biochemistry'
  | 'physiology'
  | 'microbiology'
  | 'pharmacology'
  | 'forensic'
  | 'pathology'
  | 'eye'
  | 'ear'
  | 'community'
  | 'stethoscope'
  | 'surgery'
  | 'baby'
  | 'pregnant'
  | 'bone'
  | 'skin'
  | 'mind'
  | 'needle'
  | 'radiology';

export type SubjectDefinition = {
  id: SubjectId;
  title: string;
  variant: SubjectVariant;
  iconKey: SubjectIconKey;
};

export const subjectCatalog = {
  anatomy: { id: 'anatomy', title: 'Anatomy', variant: 'premium', iconKey: 'anatomy' },
  biochemistry: { id: 'biochemistry', title: 'Biochemistry', variant: 'success', iconKey: 'biochemistry' },
  physiology: { id: 'physiology', title: 'Physiology', variant: 'error', iconKey: 'physiology' },
  microbiology: { id: 'microbiology', title: 'Microbiology', variant: 'success', iconKey: 'microbiology' },
  pharmacology: { id: 'pharmacology', title: 'Pharmacology', variant: 'accent', iconKey: 'pharmacology' },
  forensic_medicine: { id: 'forensic_medicine', title: 'Forensic Medicine', variant: 'warning', iconKey: 'forensic' },
  pathology: { id: 'pathology', title: 'Pathology', variant: 'premium', iconKey: 'pathology' },
  ophthalmology: { id: 'ophthalmology', title: 'Ophthalmology', variant: 'accent', iconKey: 'eye' },
  ent: { id: 'ent', title: 'ENT', variant: 'warning', iconKey: 'ear' },
  community_medicine: { id: 'community_medicine', title: 'Community Medicine', variant: 'success', iconKey: 'community' },
  medicine: { id: 'medicine', title: 'Medicine', variant: 'error', iconKey: 'stethoscope' },
  surgery: { id: 'surgery', title: 'Surgery', variant: 'error', iconKey: 'surgery' },
  pediatrics: { id: 'pediatrics', title: 'Pediatrics', variant: 'accent', iconKey: 'baby' },
  gynae_obstetrics: { id: 'gynae_obstetrics', title: 'Gynaecology & Obstetrics', variant: 'premium', iconKey: 'pregnant' },
  orthopedics: { id: 'orthopedics', title: 'Orthopedics', variant: 'warning', iconKey: 'bone' },
  dermatology: { id: 'dermatology', title: 'Dermatology', variant: 'success', iconKey: 'skin' },
  psychiatry: { id: 'psychiatry', title: 'Psychiatry', variant: 'premium', iconKey: 'mind' },
  anesthesia: { id: 'anesthesia', title: 'Anesthesia', variant: 'accent', iconKey: 'needle' },
  radiology: { id: 'radiology', title: 'Radiology', variant: 'error', iconKey: 'radiology' },
} as const satisfies Record<SubjectId, SubjectDefinition>;

type IconProps = { size: number; color: string };

export const subjectIcons: Record<SubjectIconKey, (props: IconProps) => React.ReactElement> = {
  anatomy: ({ size, color }) => React.createElement(MaterialCommunityIcons, { name: 'human', size, color }),
  biochemistry: ({ size, color }) => React.createElement(MaterialCommunityIcons, { name: 'flask-outline', size, color }),
  physiology: ({ size, color }) => React.createElement(MaterialCommunityIcons, { name: 'heart-pulse', size, color }),
  microbiology: ({ size, color }) => React.createElement(MaterialCommunityIcons, { name: 'bacteria-outline', size, color }),
  pharmacology: ({ size, color }) => React.createElement(MaterialCommunityIcons, { name: 'pill', size, color }),
  forensic: ({ size, color }) => React.createElement(MaterialCommunityIcons, { name: 'magnify-scan', size, color }),
  pathology: ({ size, color }) => React.createElement(MaterialCommunityIcons, { name: 'microscope', size, color }),
  eye: ({ size, color }) => React.createElement(Ionicons, { name: 'eye-outline', size, color }),
  ear: ({ size, color }) => React.createElement(MaterialCommunityIcons, { name: 'ear-hearing', size, color }),
  community: ({ size, color }) => React.createElement(Ionicons, { name: 'people-outline', size, color }),
  stethoscope: ({ size, color }) => React.createElement(MaterialCommunityIcons, { name: 'stethoscope', size, color }),
  surgery: ({ size, color }) => React.createElement(MaterialCommunityIcons, { name: 'content-cut', size, color }),
  baby: ({ size, color }) => React.createElement(MaterialCommunityIcons, { name: 'baby-face-outline', size, color }),
  pregnant: ({ size, color }) => React.createElement(MaterialCommunityIcons, { name: 'human-pregnant', size, color }),
  bone: ({ size, color }) => React.createElement(MaterialCommunityIcons, { name: 'bone', size, color }),
  skin: ({ size, color }) => React.createElement(FontAwesome5, { name: 'allergies', size: size * 0.85, color }),
  mind: ({ size, color }) => React.createElement(MaterialCommunityIcons, { name: 'head-cog-outline', size, color }),
  needle: ({ size, color }) => React.createElement(MaterialCommunityIcons, { name: 'needle', size, color }),
  radiology: ({ size, color }) => React.createElement(MaterialCommunityIcons, { name: 'radiology-box-outline', size, color }),
};

export const SubjectIcon = ({
  id,
  color,
  size,
}: {
  id: SubjectId;
  color: string;
  size: number;
}): React.ReactElement | null => {
  const iconKey = subjectCatalog[id]?.iconKey;
  const IconComponent = iconKey ? subjectIcons[iconKey] : null;
  if (!IconComponent) return null;
  return IconComponent({ size, color });
};