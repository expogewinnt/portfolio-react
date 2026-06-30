"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = {};

type LoginFormProps = {
  disabled?: boolean;
};

export function LoginForm({ disabled = false }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="adminLoginForm">
      <label className="adminField">
        <span>Username</span>
        <input name="username" type="text" autoComplete="username" required disabled={disabled} />
      </label>
      <label className="adminField">
        <span>Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={disabled}
        />
      </label>
      {state.error ? <p className="adminError">{state.error}</p> : null}
      <button type="submit" className="adminPrimaryButton" disabled={disabled || isPending}>
        {isPending ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}
