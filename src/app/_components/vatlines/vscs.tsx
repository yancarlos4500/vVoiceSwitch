import { useEffect, useMemo, useState } from 'react';
import {
  ActiveLandline,
  Button,
  ButtonType,
  CALL_TYPE,
  Configuration,
  IncomingLandline,
} from './App';
import Controls from './controls';
import HeadphoneSvgComponent from './headphone_svg';
import SpeakerSvgComponent from './speaker_svg';
import VscsButtonComponent from './vscs_button';

interface VscsProps {
  activeLandlines: ActiveLandline[];
  incomingLandlines: IncomingLandline[];
  outgoingLandlines: ActiveLandline[];
  heldLandlines: string[];
  config: Configuration;
  buttonPress: (id: string, type: CALL_TYPE) => void;
  holdBtn: () => void;
  releaseBtn: () => void;
  toggleGg: () => void;
  toggleOver: () => void;
  ggLoud: boolean;
  overrideLoud: boolean;
  settingsEdit: (val: boolean) => void;
  volume: {
    volume: number;
    setVolume: (val: number) => void;
  };
  playError: () => void;
  metadata: {
    position: string;
    sector: string;
    facilityId: string;
  };
}

export default function VscsComponent(props: VscsProps) {
  const [page, setPage] = useState(1);
  const [func, setFunc] = useState('PRI');
  const btns: Button[] = useMemo(() => {
    const tmp = [];
    const layouts = props.config?.layouts || [];
    for (let i = 0; i < 54; i++) {
      const match = layouts.find((l: any) => l.order === i);
      if (match) {
        tmp.push(match.button);
      } else {
        tmp.push({
          shortName: '',
          longName: '',
          target: '',
          type: ButtonType.NONE,
        });
      }
    }
    return tmp;
  }, [props.config]);
  const [buttons, setButtons] = useState(btns);
  const testFunc = (a: string, b: ButtonType) => {
    if (!a || !b) {
      return;
    }
    props.buttonPress(a, CALL_TYPE[b]);
  };

  const callAnsBtn = () => {
    const toAnswer = props.incomingLandlines[0];
    if (toAnswer) {
      testFunc(toAnswer.from, toAnswer.type as CALL_TYPE & ButtonType);
    } else {
      props.playError();
    }
  };

  const swapPages = () => {
    if (page === 1) {
      setPage(2);
    } else {
      setPage(1);
    }
  };

  const funcAltBtn = () => {
    if (func === 'PRI') {
      setFunc('ALT');
    } else {
      setFunc('PRI');
    }
  };

  useEffect(() => {
    const slice = btns
      .slice(0, 54)
      .filter((_b, i) => i < page * 27 && i >= (page - 1) * 27);

    while (slice.length < 27) {
      slice.push({
        shortName: '',
        longName: '',
        target: '',
        type: ButtonType.NONE,
      });
    }
    setButtons(slice);
  }, [page, btns]);

  useEffect(() => {
    console.log('out1', props.outgoingLandlines);
    console.log('in1', props.incomingLandlines);
    console.log('act1', props.activeLandlines);
    // Outgoing
    props.outgoingLandlines.forEach((line) => {
      document
        .querySelectorAll(`.${line.target}.${line.type}`)
        .forEach((el) => {
          el.classList.toggle('vscs-active-call', false);
          el.classList.toggle('vscs-incoming-bg', true);
        });
    });
    let outgoingSlow = setInterval(() => {
      props.outgoingLandlines.forEach((line) => {
        document
          .querySelectorAll(`.${line.target} .${line.type}`)
          .forEach((el) => {
            el.classList.toggle('vscs-active-call');
          });
      });
    }, 750);

    // Incoming
    props.incomingLandlines.forEach((line) => {
      document
        .querySelectorAll(`.${line.target}.${line.type}`)
        .forEach((el) => {
          el.classList.toggle('vscs-active-call', false);
          el.classList.toggle('vscs-incoming-bg', true);
        });
      document.querySelectorAll(`.${line.from}.${line.type}`).forEach((el) => {
        el.classList.toggle('vscs-active-call', false);
        el.classList.toggle('vscs-incoming-bg', true);
      });
    });
    let incomingSlow = setInterval(() => {
      props.incomingLandlines.forEach((line) => {
        document
          .querySelectorAll(`.${line.target}.${line.type}`)
          .forEach((el) => {
            el.classList.toggle('vscs-active-call');
          });
        document
          .querySelectorAll(`.${line.from}.${line.type}`)
          .forEach((el) => {
            el.classList.toggle('vscs-active-call');
          });
      });
    }, 750);

    // Active
    props.activeLandlines.forEach((line) => {
      if (props.heldLandlines.includes(line.id)) {
        document
          .querySelectorAll(`.${line.target}.${line.type}`)
          .forEach((el) => {
            el.classList.toggle('vscs-held', false);
          });

        document
          .querySelectorAll(`.${line.from}.${line.type}`)
          .forEach((el) => {
            el.classList.toggle('vscs-held', false);
          });
      } else {
        const from =
          line.type === CALL_TYPE.CONVERTED_SHOUT ||
          line.type === CALL_TYPE.SHOUT
            ? line.from.split('-')[0]
            : line.from;
        document
          .querySelectorAll(`.${line.target}.${line.type}`)
          .forEach((el) => {
            el.classList.toggle('vscs-active-call', false);
            el.classList.toggle('vscs-active-bg', true);
          });

        document.querySelectorAll(`.${from}.${line.type}`).forEach((el) => {
          el.classList.toggle('vscs-active-call', false);
          el.classList.toggle('vscs-active-bg', true);
        });
      }
    });

    let activeFast = setInterval(() => {
      props.activeLandlines.forEach((line) => {
        if (props.heldLandlines.includes(line.id)) {
          document
            .querySelectorAll(`.${line.target}.${line.type}`)
            .forEach((el) => {
              el.classList.toggle('vscs-held', true);
            });
          document
            .querySelectorAll(`.${line.from}.${line.type}`)
            .forEach((el) => {
              el.classList.toggle('vscs-held', true);
            });
        } else {
          const from =
            line.type === CALL_TYPE.CONVERTED_SHOUT ||
            line.type === CALL_TYPE.SHOUT
              ? line.from.split('-')[0]
              : line.from;
          document
            .querySelectorAll(`.${line.target}.${line.type}`)
            .forEach((el) => {
              el.classList.toggle('vscs-active-call');
            });
          document.querySelectorAll(`.${from}.${line.type}`).forEach((el) => {
            el.classList.toggle('vscs-active-call');
          });
        }
      });
    }, 250);

    return () => {
      console.log('unloading lines arrays');
      clearInterval(outgoingSlow);
      clearInterval(incomingSlow);
      clearInterval(activeFast);
      document.querySelectorAll(`.vscs-button`).forEach((el) => {
        el.classList.toggle('vscs-active-call', false);
        el.classList.toggle('vscs-active-bg', false);
        el.classList.toggle('vscs-incoming-bg', false);
        el.classList.toggle('vscs-held', false);
      });
    };
  }, [
    props.activeLandlines,
    props.incomingLandlines,
    props.outgoingLandlines,
    props.heldLandlines,
  ]);

  return (
    <>
      <div className="bg-zinc-700 p-0.5 vscs-panel tracking-tight leading-none select-none">
        <div className="grid grid-cols-9 gap-y-3">
          {buttons.map((btn, i) => (
            <VscsButtonComponent
              key={i}
              config={btn}
              typeString={
                btn.type === ButtonType.OVERRIDE
                  ? 'OVR'
                  : btn.type === ButtonType.RING
                    ? 'NORM'
                    : btn.type === ButtonType.SHOUT
                      ? btn.dialCode ?? ''
                      : btn.type === ButtonType.NONE
                        ? ''
                        : ''
              }
              callback={testFunc}
              className={`${btn.target} ${btn.type} vscs-button w-20 h-20 ${
                btn.type !== ButtonType.NONE
                  ? 'cursor-pointer'
                  : 'cursor-not-allowed'
              }`}
            />
          ))}
          {/* Static buttons */}
          <div className="vscs-empty col-start-1 col-end-7">
            <div className="flex gap-x-3 px-5">
              <div className="bg-zinc-400 w-1/4 h-20"></div>
              <div className="bg-zinc-400 w-1/4 h-20"></div>
              <div className="bg-zinc-400 w-1/4 h-20"></div>
              <div className="bg-zinc-400 w-1/4 h-20"></div>
            </div>
          </div>
          <div
            className="bg-cyan-400 vscs-static-button flex justify-center items-center w-20 h-20 cursor-pointer"
            onClick={() => callAnsBtn()}
          >
            CALL ANS
          </div>

          <div className="bg-zinc-400 vscs-empty col-start-1 col-end-5 h-20"></div>
          <div className="vscs-empty col-span-2 h-20"></div>

          <div
            className="vscs-static flex justify-center items-center h-20 bg-cyan-400 w-20 cursor-pointer"
            onClick={() => props.holdBtn()}
          >
            HOLD
          </div>
          <div className="grid col-span-9 grid-cols-subgrid text-center -mt-3">
            <div className="text-black w-20 h-4 bg-zinc-50">
              <div className="text-center">G/G {page}</div>
            </div>
            <div className="text-black w-20 h-4 bg-zinc-50">
              <div className="text-center">{func}</div>
            </div>
            <div className="col-span-7 h-4"></div>

            <div
              className="h-20 bg-cyan-400 w-20 flex items-center vscs-static-button cursor-pointer"
              onClick={() => swapPages()}
            >
              SCRN ALT
            </div>
            <div
              className="h-20 bg-cyan-400 w-20 flex items-center vscs-static-button cursor-pointer"
              onClick={() => funcAltBtn()}
            >
              FUNC ALT
            </div>
            <div
              className="h-20 bg-cyan-400 w-20 flex items-center vscs-static-button cursor-pointer"
              onClick={() => swapPages()}
            >
              G/G ALT
            </div>
            <div className="h-20 bg-cyan-400 w-20 flex items-center vscs-static-button cursor-not-allowed">
              PSN REL
            </div>
            <div
              className="h-20 bg-cyan-400 w-20 flex items-center vscs-static-button cursor-pointer"
              onClick={() => props.toggleGg()}
            >
              <div>
                <div className="flex items-center justify-center">G/G</div>
                <div className="h-6">
                  {props.ggLoud ? (
                    <SpeakerSvgComponent />
                  ) : (
                    <HeadphoneSvgComponent />
                  )}
                </div>
              </div>
            </div>
            <div
              className="h-20 bg-cyan-400 w-20 flex items-center vscs-static-button cursor-pointer"
              onClick={() => props.toggleOver()}
            >
              <div>
                <div className="flex items-center justify-center">OVR</div>
                <div className="h-6">
                  {props.overrideLoud ? (
                    <SpeakerSvgComponent />
                  ) : (
                    <HeadphoneSvgComponent />
                  )}
                </div>
              </div>
            </div>
            <div className="h-20 bg-cyan-400 w-20 flex items-center vscs-static-button cursor-not-allowed">
              {func === 'PRI' ? 'CALL FWD' : 'HOLLER ON/OFF'}
            </div>
            <div
              className="h-20 bg-cyan-400 col-start-8 col-end-10 flex items-center justify-center vscs-static-button cursor-pointer"
              onClick={() => props.releaseBtn()}
            >
              RLS
            </div>
          </div>
        </div>
        <div className="mt-5">
          <Controls
            handleClick={props.settingsEdit}
            volume={props.volume.volume}
            setVolume={props.volume.setVolume}
            metadata={props.metadata}
          />
        </div>
      </div>
    </>
  );
}
