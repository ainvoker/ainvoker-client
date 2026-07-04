import type React from "react";
import type { ChangeHandler, RefCallBack } from "react-hook-form";

export type InputGroupParams = { 
    label: string;
    type: React.HTMLInputTypeAttribute;
    placeholder: string;
    error: string | undefined;
    name: string;
    onChange: ChangeHandler;
    onBlur: ChangeHandler;
    ref: RefCallBack;
}