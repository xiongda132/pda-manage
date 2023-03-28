import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
  useLocation,
  useHistory,
} from "react-router-dom";
import Login from "./Login";
import Home from "./views/Home";
import Scan from "./views/Scan";
// import Download from "./views/Download";
import Construction from "./views/Construction";
import Steel from "./views/Steel";
import Upload from "./views/Upload";
import AssetView from "./views/AssetView";
import SpecialDevice from "./views/SpecialDevice";
import { getAuthentication } from "./utils/auth";
import ProvideAuth from "./auth/ProvideAuth";
import TagBind from "./views/TagBind";
import CardManage from "./views/CardManage";
import Procedure from "./views/Procedure";
import Manage from "./views/Manage";
import Unbind from "./views/Unbind";
import Inventory from "./views/Inventory";

function App() {
  return (
    <>
      <ProvideAuth>
        <Router>
          <Switch>
            <Route exact path="/login">
              <Login />
            </Route>
            <Route path="/tagBind">
              <TagBind />
            </Route>
            <Route path="/cardManage">
              <CardManage />
            </Route>
            <Route path="/procedure">
              <Procedure />
            </Route>
            <Route path="/manage">
              <Manage />
            </Route>
            <Route path="/unbind">
              <Unbind />
            </Route>
            <Route path="/inventory">
              <Inventory />
            </Route>
            <PrivateRoute path="/">
              <Home />
            </PrivateRoute>
          </Switch>
        </Router>
      </ProvideAuth>
    </>
  );
}

function PrivateRoute({ children, ...rest }) {
  console.log(getAuthentication());
  const hasAuthenticated = getAuthentication() === "1";
  return (
    <Route
      {...rest}
      render={({ location }) =>
        hasAuthenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}
export default App;
