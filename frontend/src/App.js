import "./App.css";
import { Community } from "./components/Community";
import { BookSearch } from "./components/book/BookSearch";
import { PostRegister } from "./components/PostRegister";
import { ReadingAnalytics } from "./components/ReadingAnalytics";
import { Information } from "./components/Information";
import { UserPage } from "./components/UserPage";
import { Memo } from "./components/Memo";
import { NotifyProvider } from "./hooks/NotifyProvider";
import { Login } from "./components/Login";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { UserProvider } from "./components/UserProvider";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, CssBaseline, Container, Divider } from "@mui/material";
import { HandleRegister } from "./components/HandleRegister";
import RequireAuth from "./components/RequireAuth";

function App() {
  return (
    <Router>
      <div className="App">
        <UserProvider>
          <NotifyProvider>
            <CssBaseline />

            <Container maxWidth="lg" sx={{ px: 2, overflow: "visible" }}>
              <Box
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: (theme) => theme.zIndex.appBar,
                  backgroundColor: "white", // 背景指定しないと後ろが透ける
                }}
              >
                <Header />
              </Box>
              <Box>
                <Box
                  component="main"
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    minHeight: "100vh",
                    // p: 1,
                    gap: 3,
                    // justifyContent: "center",
                    // alignItems: "center",

                    // pt: "70px",
                  }}
                >
                  <Sidebar />
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ borderColor: "#ddd", alignSelf: "stretch" }}
                  />
                  <Box sx={{ width: "100%", maxWidth: 650, mt: 2 }}>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/book" element={<BookSearch />} />
                      <Route path="/" element={<Community />} />
                      <Route
                        path="/analytics"
                        element={
                          <RequireAuth>
                            <ReadingAnalytics />
                          </RequireAuth>
                        }
                      />
                      <Route path="/information" element={<Information />} />
                      <Route path="highlights" element={<Memo />} />
                      <Route path="/postRegister" element={<PostRegister />} />
                      <Route path="/:handle" element={<UserPage />} />
                      <Route
                        path="/handleRegister"
                        element={<HandleRegister />}
                      />
                    </Routes>
                  </Box>
                </Box>
              </Box>
            </Container>
          </NotifyProvider>
        </UserProvider>
      </div>
    </Router>
  );
}

export default App;
