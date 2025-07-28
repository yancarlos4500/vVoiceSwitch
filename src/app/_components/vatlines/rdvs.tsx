import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import {
  ActiveLandline,
  Button,
  ButtonLayout,
  ButtonType,
  CALL_TYPE,
  Configuration,
  IncomingLandline,
} from './App';
import Controls from './controls';
import RdvsButtonComponent from './rdvs_button';

interface RdvsProps {
  activeLandlines: ActiveLandline[];
  incomingLandlines: IncomingLandline[];
  outgoingLandlines: ActiveLandline[];
  heldLandlines: string[];
  config: Configuration;
  buttonPress: (id: string, type: CALL_TYPE) => void;
  toggleGg: () => void;
  toggleOver: () => void;
  ggRoute: boolean;
  overrideRoute: boolean;
  holdBtn: () => void;
  releaseBtn: () => void;
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

export default function RdvsComponent(props: RdvsProps) {
  const [page, setCurrentPage] = useState(1);
  
  const btns: ButtonLayout[] = useMemo(() => {
    return props.config?.layouts || [];
  }, [props.config?.layouts]);
  
  const maxPageMath = Math.ceil(
    (btns.length > 0 ? btns.sort((a, b) => b.order - a.order)[0]?.order || 0 : 0) / 60,
  );
  const maxPage = isNaN(maxPageMath) ? 1 : maxPageMath < 1 ? 1 : maxPageMath;
  // const [func, setFunc] = useState('PRI');
  const [buttons, setButtons] = useState<Button[]>(btns.map((l) => l.button));
  const testFunc = (a: string, b: ButtonType) => {
    props.buttonPress(a, CALL_TYPE[b]);
  };

  const playError = () => {
    props.playError();
  };

  const setPage = (val: number) => {
    if (val < 1) {
      setCurrentPage(1);
      playError();
    } else if (val > maxPage) {
      setCurrentPage(maxPage);
      playError();
    } else {
      setCurrentPage(val);
    }
  };

  useEffect(() => {
    const pageButtons = btns.filter(
      (l) => l.order < page * 60 && l.order >= (page - 1) * 60,
    );

    const slice: Button[] = [];
    for (let i = (page - 1) * 60; i < page * 60; i++) {
      const found = pageButtons.find((l) => Number(l.order) === i);
      if (found) {
        slice.push(found.button);
      } else {
        slice.push({
          shortName: '',
          longName: '',
          target: '',
          type: ButtonType.NONE,
        });
      }
    }

    setButtons(slice);
  }, [page, btns]);

  useEffect(() => {
    props.outgoingLandlines.forEach((line) => {
      document
        .querySelectorAll(`.${line.target}.${line.type}`)
        .forEach((el) => el.classList.toggle('rdvs-active-call', true));
    });

    let incomingSlow = setInterval(() => {
      props.incomingLandlines.forEach((line) => {
        // document
        //     .querySelectorAll(`.${line.target}.${line.type}`)
        //     .forEach((el) => el.classList.toggle('rdvs-active-call'));
        document
          .querySelectorAll(`.${line.from}.${line.type}`)
          .forEach((el) => el.classList.toggle('rdvs-active-call'));
      });
    }, 750);

    let activeFast = setInterval(() => {
      props.activeLandlines.forEach((line) => {
        if (props.heldLandlines.includes(line.id)) {
          document
            .querySelectorAll(`.${line.target}.${line.type}`)
            .forEach((el) => el.classList.toggle('rdvs-held', true));
          document
            .querySelectorAll(`.${line.from}.${line.type}`)
            .forEach((el) => el.classList.toggle('rdvs-held', true));
        } else {
          document
            .querySelectorAll(`.${line.target}.${line.type}`)
            .forEach((el) => el.classList.toggle('rdvs-active-call'));
          document
            .querySelectorAll(`.${line.from}.${line.type}`)
            .forEach((el) => el.classList.toggle('rdvs-active-call'));
        }
      });
    }, 250);
    return () => {
      clearInterval(incomingSlow);
      clearInterval(activeFast);
      document.querySelectorAll('.rdvs-button').forEach((el) => {
        el.classList.toggle('rdvs-active-call', false);
        el.classList.toggle('rdvs-held', false);
      });
    };
  }, [
    props.activeLandlines,
    props.heldLandlines,
    props.incomingLandlines,
    props.outgoingLandlines,
  ]);

  return (
    <>
      <div className="rdvs-panel select-none p-2 text-[#008000] bg-black">
        <div className="top-row grid grid-cols-4 mb-2">
          <div className="brightness flex">
            <div className="bright w-16 text-center" onClick={playError}>
              Bright &#9711;
            </div>
            <div id="brightness" className="px-2 pt-6">
              50%
            </div>
            <div className="dim w-8 text-center" onClick={playError}>
              Dim &#9711;
            </div>
          </div>
          <div className="top-page grid grid-rows-3 leading-none">
            <div className="current-page flex-initial pl-8">Page {page}</div>
            <div className="flex">
              <div
                className="cursor-pointer mr-3"
                onClick={() => setPage(page - 1)}
              >
                <Image
                  src="/rdvs/prev-arrow.png"
                  width={50}
                  height={50}
                  alt="Prev"
                  style={{ width: '50px', height: 'auto' }}
                />
              </div>
              <div className="cursor-pointer" onClick={() => setPage(page + 1)}>
                <Image
                  src="/rdvs/next-arrow.png"
                  width={50}
                  height={50}
                  alt="Next"
                  style={{ width: '50px', height: 'auto' }}
                />
              </div>
            </div>
            <div className="total-pages flex-initial pl-10">of {maxPage}</div>
          </div>
          <div className="ia-ovr-ca flex text-center">
            <div className="ia w-10">
              IA
              <br />
              <span className="border">&nbsp;&nbsp;</span>
            </div>
            <div className="ovr w-10">
              OVR <br />
              <span className="mx-auto border border-[#008000]">&nbsp;</span>
            </div>
            <div className="ca w-10">
              CA <br />
              <span className="border">&nbsp;&nbsp;</span>
            </div>
          </div>
          <div className="messages border"></div>
        </div>
        <div className="grid grid-cols-10 gap-y-2">
          {buttons.map((btn, i) => (
            <RdvsButtonComponent
              key={i}
              config={btn}
              typeString={btn.type.toString().substring(0, 1)}
              callback={testFunc}
              className={`${btn.target} ${btn.type} rdvs-button ${
                btn.type === ButtonType.OVERRIDE ? 'rdvs-red' : 'rdvs-green'
              } ${
                btn.type !== ButtonType.NONE
                  ? 'cursor-pointer'
                  : 'cursor-not-allowed invisible'
              }`}
            />
          ))}
          {page === 1 ? (
            <>
              <RdvsButtonComponent
                config={{
                  shortName: '',
                  longName: 'HOLD',
                  target: '',
                  type: ButtonType.NONE,
                }}
                typeString=""
                className={`rdvs-static-btn bg-zinc-500`}
                callback={props.holdBtn}
              />
              <RdvsButtonComponent
                config={{
                  shortName: '',
                  longName: 'RLS',
                  target: '',
                  type: ButtonType.NONE,
                }}
                typeString=""
                className={`rdvs-static-btn bg-zinc-500`}
                callback={props.releaseBtn}
              />
              <RdvsButtonComponent
                config={{
                  shortName: '',
                  longName: 'HL',
                  target: '',
                  type: ButtonType.NONE,
                }}
                typeString=""
                className={`rdvs-static-btn bg-zinc-500 ${
                  props.ggRoute ? 'static-active' : ''
                }`}
                callback={props.toggleGg}
              />
              <RdvsButtonComponent
                config={{
                  shortName: '',
                  longName: 'OHL',
                  target: '',
                  type: ButtonType.NONE,
                }}
                typeString=""
                className={`rdvs-static-btn bg-zinc-500 ${
                  props.overrideRoute ? 'static-active' : ''
                }`}
                callback={props.toggleOver}
              />
              <RdvsButtonComponent
                config={{
                  shortName: '',
                  longName: 'RHL',
                  target: '',
                  type: ButtonType.NONE,
                }}
                typeString=""
                className={`rdvs-static-btn bg-zinc-500 cursor-not-allowed`}
                callback={() => {}}
              />
            </>
          ) : (
            <div className="h-14"></div>
          )}
        </div>
        <div className="bottom-bar flex tracking-tight">
          <div className="pages flex mt-auto px-2">
            {[...Array(maxPage)].map((_x, i) => (
              <div
                key={i}
                className="border rounded-t-xl px-1 mx-1 cursor-pointer"
                onClick={() => setPage(i + 1)}
              >
                Page {i + 1}
              </div>
            ))}
          </div>
          <div className="flex-grow"></div>
          <div className="hsls">
            <div className="hs text-red-600">
              <span className="border border-[#008000] text-white mr-1">
                HS
              </span>
              &#9675;
            </div>
            <div className="ls text-red-600">
              <span className="border border-[#008000] text-white mr-1">
                LS
              </span>
              &#9675;
            </div>
          </div>
        </div>
        <Controls
          handleClick={props.settingsEdit}
          volume={props.volume.volume}
          setVolume={props.volume.setVolume}
          metadata={props.metadata}
        />
      </div>
    </>
  );
}
