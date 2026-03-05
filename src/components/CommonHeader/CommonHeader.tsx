import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import BackIcon from '../../assets/icons/ArrowLeft.svg';

type CommonHeaderProps = {
  onBackPress?: () => void;
};

const CommonHeader = ({ onBackPress }: CommonHeaderProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBackPress} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <BackIcon width={24} height={24} />
      </TouchableOpacity>
    </View>
  );
};

export default CommonHeader



const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingVertical: 20,
    },
})