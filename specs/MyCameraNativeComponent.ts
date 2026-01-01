import type {
  HostComponent,
  ViewProps,
} from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { DirectEventHandler, Double } from 'react-native/Libraries/Types/CodegenTypes';

type GestureEvent = Readonly<{
  gesture: string;
  confidence: Double;
}>;

type ErrorEvent = Readonly<{
  error: string;
}>;

export interface NativeProps extends ViewProps {
  onGestureDetected?: DirectEventHandler<GestureEvent>;
  onError?: DirectEventHandler<ErrorEvent>;
}

export default codegenNativeComponent<NativeProps>(
  'CustomMyCamera',
) as HostComponent<NativeProps>;