"use client"
import * as React from "react"

export type Model = {
  name: string;
  title: string;
  description: string;
};


interface GlobalContextType {
  models: Model[];
  setModels: React.Dispatch<React.SetStateAction<Model[]>>;
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
}

const GlobalContext = React.createContext<GlobalContextType | undefined>(undefined);


export function useGlobalContext() {
  const ctx = React.useContext(GlobalContext);
  if (!ctx) throw new Error("useGlobalContext must be used within a GlobalProvider");
  return ctx;
}

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [models, setModels] = React.useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = React.useState<string>("");

  return (
    <GlobalContext.Provider value={{ models, setModels, selectedModel, setSelectedModel }}>
      {children}
    </GlobalContext.Provider>
  );
}
