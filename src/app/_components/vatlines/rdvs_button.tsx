import { ButtonType } from './App';

interface ButtonProps {
  shortName: string;
  longName: string;
  target: string;
  type: ButtonType;
}

interface Callback {
  (target: string, type: ButtonType): void;
}

export default function RdvsButtonComponent(props: {
  config: ButtonProps;
  typeString: string;
  callback: Callback;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={() => props.callback(props.config.target, props.config.type)}
      className={'text-small w-16 h-14 leading-none ' + props.className}
    >
      <div className="first-line">
        {props.config.shortName === '' ? (
          <br />
        ) : (
          props.config.shortName.slice(0, 3)
        )}
      </div>
      <div className="second-line">
        {props.config.longName === '' ? (
          <br />
        ) : (
          props.config.longName.slice(0, 6)
        )}
      </div>
      <div className="outline outline-1 outline-cyan-500 flex items-center w-3 h-3 justify-center mx-auto mt-1 indicator">
        {props.typeString}
      </div>
    </button>
  );
}
