import { createContext, useState, useContext, ReactNode } from 'react';

interface SubtotalContextType {
  lineItemsSubtotal: number;
  setLineItemsSubtotal: (subtotal: number) => void;
  codingSubtotal: number;
  setCodingSubtotal: (subtotal: number) => void;
}

const SubtotalContext = createContext<SubtotalContextType | undefined>(undefined);

export const SubtotalProvider = ({ children }: { children: ReactNode }) => {
  const [lineItemsSubtotal, setLineItemsSubtotal] = useState(0);
  const [codingSubtotal, setCodingSubtotal] = useState(0);

  return (
    <SubtotalContext.Provider value={{ lineItemsSubtotal, setLineItemsSubtotal, codingSubtotal, setCodingSubtotal }}>
      {children}
    </SubtotalContext.Provider>
  );
};

export const useSubtotals = () => {
  const context = useContext(SubtotalContext);
  if (context === undefined) {
    throw new Error('useSubtotals must be used within a SubtotalProvider');
  }
  return context;
};