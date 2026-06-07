import {
  Icon,
  Center,
  Caption,
  CardView,
  TitleText
} from 'react-native-boxes';

import { useTheme } from '../theme/ThemeContext';


export type FeatureCardProps = {
  icon: string;
  title: string;
  subtitle: string;
};

export function FeatureCard({ icon, title, subtitle }: FeatureCardProps) {
  const theme = useTheme().theme;

  return (
    <CardView style={{ backgroundColor: theme.color.card }}>
      <Center style={{ padding: theme.space.md, backgroundColor: theme.color.surface }}>
        <Icon name={icon} />
      </Center>

      <TitleText style={{ fontFamily: theme.fontFamily.number }}>
        {title}
      </TitleText>
      <Caption style={{ fontFamily: theme.fontFamily.text }}>
        {subtitle}
      </Caption>
    </CardView>
  );
}
