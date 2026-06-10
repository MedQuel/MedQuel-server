import React from 'react';

export interface LayoutData {
  bottomBarVisible: boolean;
  bottomBarSelectedId: string;
  bottomBarHeight: number;
}
export interface LayoutContextValue {
  layoutData: LayoutData;
  setBottomBarVisible: (visible: boolean) => void;
  setBottomBarSelectedId: (id: string) => void;
  _setBottomBarHeight: (height: number) => void;
}

const DEFAULT_LAYOUT: LayoutData = {
  bottomBarVisible: true,
  bottomBarSelectedId: 'home',
  bottomBarHeight: 0,
};
export const LayoutContext = React.createContext<LayoutContextValue>({
  layoutData: DEFAULT_LAYOUT,
  setBottomBarVisible: () => {},
  setBottomBarSelectedId: () => {},
  _setBottomBarHeight: () => {},
});


export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [layoutData, setLayoutData] = React.useState<LayoutData>(DEFAULT_LAYOUT);

  const setBottomBarVisible = React.useCallback((visible: boolean) => {
    setLayoutData((prev) =>
      prev.bottomBarVisible === visible
        ? prev
        : { ...prev, bottomBarVisible: visible }
    );
  }, []);
  const setBottomBarSelectedId = React.useCallback((id: string) => {
    setLayoutData((prev) =>
      prev.bottomBarSelectedId === id
        ? prev
        : { ...prev, bottomBarSelectedId: id }
    );
  }, []);
  const _setBottomBarHeight = React.useCallback((height: number) => {
    setLayoutData((prev) =>
      prev.bottomBarHeight === height
        ? prev
        : { ...prev, bottomBarHeight: height }
    );
  }, []);

  const value = React.useMemo<LayoutContextValue>(
    () => ({
      layoutData,
      setBottomBarVisible,
      setBottomBarSelectedId,
      _setBottomBarHeight,
    }),
    [
      layoutData,
      setBottomBarVisible,
      setBottomBarSelectedId,
      _setBottomBarHeight,
    ]
  );

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}

export function useLayoutContext() {
  return React.useContext(LayoutContext);
}
