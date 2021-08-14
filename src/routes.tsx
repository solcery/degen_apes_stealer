import { HashRouter, Route, Switch, Link } from "react-router-dom";
import React from "react";
import { WalletProvider } from "./contexts/wallet";
import { ConnectionProvider } from "./contexts/connection";
import { AccountsProvider } from "./contexts/accounts";
import { AppLayout } from "./components/Layout";

import { HomeView } from "./views";

export function Routes() {
  return (
    <>
      <HashRouter basename={"/"}>
        <ConnectionProvider>
          <WalletProvider>
              <AccountsProvider>
                <AppLayout>
                  <Switch>
                    <Route exact path="/" component={() => <HomeView />} />
                  </Switch>
                </AppLayout>
              </AccountsProvider>
          </WalletProvider>
        </ConnectionProvider>
      </HashRouter>
    </>
  );
}
