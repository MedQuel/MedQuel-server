import React from 'react';
import { ViewStyle } from 'react-native';
import { Caption, CardView, Center, Icon, TitleText } from 'react-native-boxes';

export type FeatureCardProps = {
  icon: string;
  title: string;
  subtitle: string;
  iconBackground?: string;
} & ViewStyle;

export function FeatureCard(props: FeatureCardProps) {
  // const theme = useContext(ThemeContext);
  // const themeName = theme.name; // dark or light

  return (
    <CardView
      style={{
        width: 150,
        borderWidth: 2,
        borderColor: 'black',
      }}
    >
      <Center
        style={{
          padding: 16,
          width: 'auto',
          backgroundColor: props.iconBackground,
        }}
      >
        <Icon name={props.icon} />
      </Center>
      <TitleText>{props.title}</TitleText>
      <Caption>{props.subtitle}</Caption>
    </CardView>
  );
}
