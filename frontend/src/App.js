import "./App.css";
import { Community } from "./components/Community";
import { BookSearch } from "./components/book/BookSearch";
import { PostRegister } from "./components/PostRegister";
import { ReadingAnalytics } from "./components/ReadingAnalytics";
import { Information } from "./components/Information";
import { UserPage } from "./components/UserPage";
import { ScrollToTop } from "./components/ScrollToTop";
import { Memo } from "./components/Memo";
import { NotifyProvider } from "./hooks/NotifyProvider";
import { Login } from "./components/Login";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { UserProvider } from "./components/UserProvider";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, CssBaseline, Container, Divider } from "@mui/material";
import { HandleRegister } from "./components/HandleRegister";
import { Notification } from "./components/Notification";

function App() {
  return (
    <Router>
      <div className="App">
        <UserProvider>
          <ScrollToTop />
          <NotifyProvider>
            <CssBaseline />
            <Box
              sx={{
                mx: "auto",
                backgroundColor: "white",
              }}
            >
              <Header />
            </Box>
            <Box sx={{ backgroundColor: "#F5F5F5", minHeight: "100vh" }}>
              <Container
                maxWidth="lg"
                sx={{
                  px: 1,
                  overflow: "visible",
                  mt: "65px",
                }}
              >
                <Box>
                  <Box
                    component="main"
                    className="flex flex-col md:flex-row gap-2 pb-[50px] md:pb-0"
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      minHeight: "100vh",
                      gap: 3,
                    }}
                  >
                    <div className="hidden md:block">
                      <Sidebar />
                    </div>
                    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
                      <Sidebar mobile />
                    </div>
                    <Divider
                      orientation="vertical"
                      className="hidden md:block"
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
                          element={<ReadingAnalytics />}
                        />
                        <Route path="/information" element={<Information />} />
                        <Route path="highlights" element={<Memo />} />
                        <Route
                          path="/postRegister"
                          element={<PostRegister />}
                        />
                        <Route path="/:handle" element={<UserPage />} />
                        <Route
                          path="/handleRegister"
                          element={<HandleRegister />}
                        />
                        <Route
                          path="/notifications"
                          element={<Notification />}
                        />
                      </Routes>
                    </Box>
                  </Box>
                </Box>
              </Container>
            </Box>
          </NotifyProvider>
        </UserProvider>
      </div>
    </Router>
  );
}

export default App;
