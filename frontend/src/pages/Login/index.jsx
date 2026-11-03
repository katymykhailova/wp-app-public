import { useState } from "react";
import { useNavigate } from "react-router";
import { useLoginMutation } from "@/store/services";

import Content from "@/layouts/Content";
import { PageLayoutProvider } from "@/layouts/PageLayoutProvider";
import { pagesConfig } from "@/shared/config/pages.config";
import Button from "@/shared/ui/Button";

import s from "./ui/Login.module.scss";

const Login = () => {
  const config = pagesConfig["/login"];

  const navigate = useNavigate();
  const [login, { isLoading, error }] = useLoginMutation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await login({ username, password }).unwrap();

      navigate("/");
    } catch (err) {
      console.error("Login failed", err);
    }
  };
  return (
    <PageLayoutProvider config={config}>
      <Content>
        <form onSubmit={handleSubmit} className={s.loginForm}>
          <div className={s.loginFormWrap}>
            <label htmlFor="username" className={s.loginFormLabel}>
              Benutzername
            </label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className={s.loginFormInput}
            />
            <label htmlFor="password" className={s.loginFormLabel}>
              Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className={s.loginFormInput}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Anmelden..." : "Anmelden"}
            </Button>

            {error && <p>Benutzername oder Passwort ist falsch.</p>}
          </div>
        </form>
      </Content>
    </PageLayoutProvider>
  );
};

export default Login;
