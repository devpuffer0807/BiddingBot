import React from "react";
import Toggle from "../common/Toggle";
import { TaskFormState } from "@/hooks/useTaskForm";

const StartSection = ({ formState, setFormState }: IStartSection) => {
  return (
    <div className="mt-6">
      <h2 className="font-medium mb-4">Start Immediately</h2>
      <div className="flex items-center">
        <span
          className="mr-2 text-sm cursor-pointer"
          onClick={() =>
            setFormState((prev) => ({
              ...prev,
              running: !prev.running,
            }))
          }
        >
          Start
        </span>
        <Toggle
          checked={formState.running}
          onChange={() =>
            setFormState((prev) => ({
              ...prev,
              running: !prev.running,
            }))
          }
        />
      </div>
    </div>
  );
};

export default StartSection;

interface IStartSection {
  formState: TaskFormState;
  setFormState: React.Dispatch<React.SetStateAction<TaskFormState>>;
}
