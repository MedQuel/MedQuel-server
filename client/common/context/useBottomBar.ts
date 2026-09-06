import { useEffect, useRef } from 'react';
import { useLayoutContext } from './LayoutContext';


export function useBottomBar(visible: boolean, selectedId?: string) {
  const { setBottomBarVisible, setBottomBarSelectedId } = useLayoutContext();

  const setVisibleRef = useRef(setBottomBarVisible);
  const setSelectedRef = useRef(setBottomBarSelectedId);

  useEffect(() => {
    setVisibleRef.current = setBottomBarVisible;
  }, [setBottomBarVisible]);
  useEffect(() => {
    setSelectedRef.current = setBottomBarSelectedId;
  }, [setBottomBarSelectedId]);

  useEffect(() => {
    setVisibleRef.current(visible);
    if (selectedId !== undefined) setSelectedRef.current(selectedId);
  }, [visible, selectedId]);
}
