import { ButtonType } from './App';
import SpeakerSvgComponent from './speaker_svg';

interface ButtonProps {
  shortName: string;
  longName: string;
  target: string;
  type: ButtonType;
}

interface Callback {
  (target: string, type: ButtonType): void;
}

export default function VscsButtonComponent(props: {
  config: ButtonProps;
  typeString: string;
  callback: Callback;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={() => props.callback(props.config.target, props.config.type)}
      className={'' + props.className}
    >
      <div className="first-line">
        <div className="scale-75 h-4 pb-4">
          {props.config.type === ButtonType.SHOUT ? (
            <SpeakerSvgComponent />
          ) : null}
        </div>
        {props.config.shortName}
      </div>
      <div className="second-line">{props.config.longName}</div>
      <div className="landline-type mt-4">{props.typeString}</div>
    </button>
  );
}
