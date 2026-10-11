import React from 'react';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';


export type SubjectVariant = 'error' | 'accent' | 'success' | 'premium' | 'warning';
export type SubjectId =
  | 'anatomy' | 'anesthesiology' | 'biochemistry' | 'community_medicine'
  | 'dermatology' | 'ent' | 'forensic_medicine_toxicology' | 'gynaecology_obstetrics'
  | 'medicine' | 'microbiology' | 'ophthalmology' | 'orthopedics' | 'pathology'
  | 'pediatrics' | 'pharmacology' | 'physiology' | 'psychiatry' | 'radiology' | 'surgery';
export type SubjectIconKey =
  | 'anatomy' | 'biochemistry' | 'physiology' | 'microbiology' | 'pharmacology'
  | 'forensic' | 'pathology' | 'eye' | 'ear' | 'community'
  | 'stethoscope' | 'surgery' | 'baby' | 'girl'
  | 'bone' | 'skin' | 'mind' | 'needle' | 'radiology';

export type SubjectDefinition = {
  id: SubjectId;
  title: string;
  variant: SubjectVariant;
  iconKey: SubjectIconKey;
};

export const subjectCatalog = {
  anatomy: { id: 'anatomy', title: 'Anatomy', variant: 'premium', iconKey: 'anatomy' },
  anesthesiology: { id: 'anesthesiology', title: 'Anesthesiology', variant: 'accent', iconKey: 'needle' },
  biochemistry: { id: 'biochemistry', title: 'Biochemistry', variant: 'success', iconKey: 'biochemistry' },
  community_medicine: { id: 'community_medicine', title: 'Community Medicine', variant: 'success', iconKey: 'community' },
  dermatology: { id: 'dermatology', title: 'Dermatology', variant: 'success', iconKey: 'skin' },
  ent: { id: 'ent', title: 'ENT', variant: 'warning', iconKey: 'ear' },
  forensic_medicine_toxicology: { id: 'forensic_medicine_toxicology', title: 'Forensic Medicine & Toxicology', variant: 'warning', iconKey: 'forensic' },
  gynaecology_obstetrics: { id: 'gynaecology_obstetrics', title: 'Gynaecology & Obstetrics', variant: 'premium', iconKey: 'girl' },
  medicine: { id: 'medicine', title: 'Medicine', variant: 'error', iconKey: 'stethoscope' },
  microbiology: { id: 'microbiology', title: 'Microbiology', variant: 'success', iconKey: 'microbiology' },
  ophthalmology: { id: 'ophthalmology', title: 'Ophthalmology', variant: 'accent', iconKey: 'eye' },
  orthopedics: { id: 'orthopedics', title: 'Orthopedics', variant: 'warning', iconKey: 'bone' },
  pathology: { id: 'pathology', title: 'Pathology', variant: 'premium', iconKey: 'pathology' },
  pediatrics: { id: 'pediatrics', title: 'Pediatrics', variant: 'accent', iconKey: 'baby' },
  pharmacology: { id: 'pharmacology', title: 'Pharmacology', variant: 'accent', iconKey: 'pharmacology' },
  physiology: { id: 'physiology', title: 'Physiology', variant: 'error', iconKey: 'physiology' },
  psychiatry: { id: 'psychiatry', title: 'Psychiatry', variant: 'premium', iconKey: 'mind' },
  radiology: { id: 'radiology', title: 'Radiology', variant: 'error', iconKey: 'radiology' },
  surgery: { id: 'surgery', title: 'Surgery', variant: 'error', iconKey: 'surgery' },
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
  girl: ({ size, color }) => React.createElement(MaterialCommunityIcons, { name: 'human-female', size, color }),
  bone: ({ size, color }) => React.createElement(MaterialCommunityIcons, { name: 'bone', size, color }),
  skin: ({ size, color }) => React.createElement(FontAwesome5, { name: 'allergies', size: size * 0.85, color }),
  mind: ({ size, color }) => React.createElement(MaterialCommunityIcons, { name: 'head-cog-outline', size, color }),
  needle: ({ size, color }) => React.createElement(MaterialCommunityIcons, { name: 'needle', size, color }),
  radiology: ({ size, color }) => React.createElement(MaterialCommunityIcons, { name: 'radiology-box-outline', size, color }),
};

export const SubjectIcon = ({ id, color, size }: {
  id: SubjectId;
  color: string;
  size: number;
}): React.ReactElement | null => {
  const iconKey = subjectCatalog[id]?.iconKey;
  const IconComponent = iconKey ? subjectIcons[iconKey] : null;
  if (!IconComponent) return null;

  return IconComponent({ size, color });
};
