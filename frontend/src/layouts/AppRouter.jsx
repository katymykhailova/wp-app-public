// import React, { useContext } from "react";
import React from "react";

import { Route, Routes } from "react-router-dom";
import { publicRoutes, privateRoutes } from "@/router";
import ProtectedRoute from "@/layouts/ProtectedRoute";
import SharedLayout from "@/layouts/SharedLayout";
import Home from "@/pages/Home";

const AppRouter = ({ authenticated }) => {
  return (
    <>
      <Routes>
        <Route path="/" element={<SharedLayout />}>
          <Route index element={<Home />} />
          {publicRoutes.map((route) => (
            <Route path={route.path} element={route.element} key={route.path}>
              {route.indexElement && (
                <Route index element={route.indexElement} />
              )}
              {route.param && (
                <Route
                  path={route.param}
                  element={route.indexElement}
                  key={route.param}
                />
              )}
              {!route.param &&
                route.nested &&
                route.nested.map((subroute) => (
                  <Route
                    path={subroute.path}
                    element={subroute.element}
                    key={route.path + subroute.path}
                  />
                ))}
              {!route.param &&
                route.nested2 &&
                route.nested2.map((subroute) => (
                  <Route
                    path={subroute.path}
                    element={subroute.element}
                    key={route.path + subroute.path}
                  />
                ))}
            </Route>
          ))}
          <Route element={<ProtectedRoute isAllowed={authenticated} />}>
            {privateRoutes.map((route) => (
              <Route path={route.path} element={route.element} key={route.path}>
                {route.indexElement && (
                  <Route index element={route.indexElement} />
                )}
                {route.param && (
                  <Route
                    path={route.param}
                    element={route.indexElement}
                    key={route.param}
                  />
                )}
                {!route.param &&
                  route.nested &&
                  route.nested.map((subroute) => (
                    <Route
                      path={subroute.path}
                      element={subroute.element}
                      key={route.path + subroute.path}
                    />
                  ))}
                {!route.param &&
                  route.nested2 &&
                  route.nested2.map((subroute) => (
                    <Route
                      path={subroute.path}
                      element={subroute.element}
                      key={route.path + subroute.path}
                    />
                  ))}
              </Route>
            ))}
          </Route>
          {/* <Route
            path="admin"
            element={
              <ProtectedRoute
                redirectPath="/home"
                isAllowed={!!user && user.roles.includes("admin")}
              >
                <Admin />
              </ProtectedRoute>
            }
          ></Route> */}
        </Route>
      </Routes>
    </>
  );
};

export default AppRouter;
