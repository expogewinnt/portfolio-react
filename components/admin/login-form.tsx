"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="adminLoginForm">
      <label className="adminField">
        <span>Username</span>
        <input name="username" type="text" autoComplete="username" required />
      </label>
      <label className="adminField">
        <span>Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      {state.error ? <p className="adminError">{state.error}</p> : null}
      <button type="submit" className="adminPrimaryButton" disabled={isPending}>
        {isPending ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}
