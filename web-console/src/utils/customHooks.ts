import { useCallback, useState } from "react";

const getLocalStorageValue = <T>(key: string, initValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initValue;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return initValue;
  }
};

const useLocalStorage = <T extends object>(key: string, initValue: T) => {
  const [value, setValue] = useState<T>(() =>
    getLocalStorageValue(key, initValue)
  );

  const setLocalStorageValue = useCallback(
    (setStateAction: T | ((prevState: T) => T)) => {
      try {
        const valueToStore =
          setStateAction instanceof Function
            ? setStateAction(value)
            : setStateAction;
        setValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    },
    [key, value]
  );

  return [value, setLocalStorageValue] as const;
};

const defaultFiles = {
  "app.py": {
    name: "app.py",
    language: "python",
    value:
      '"""\n# This is a sample Python script.\n# You can run this script by using the command: python app.py\n"""\n\nprint("Hello, World!")\n',
  },
  "config.yaml": {
    name: "config.yaml",
    language: "yaml",
    value: "",
  },
};

export { useLocalStorage, defaultFiles };
