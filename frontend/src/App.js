import "./App.css";
import { Community } from "./components/Community";
import { BookSearch } from "./components/book/BookSearch";
import { PostRegister } from "./components/PostRegister";
import { ReadingAnalytics } from "./components/analytics/ReadingAnalytics";
import { Information } from "./components/Information";
import { UserPage } from "./components/UserPage";
import { ScrollToTop } from "./components/ScrollToTop";
import { Memo } from "./components/Memo";
import { NotifyProvider } from "./hooks/NotifyProvider";
import { ThemeModeProvider } from "./hooks/ThemeModeProvider";
import { Login } from "./components/Login";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { UserProvider } from "./components/UserProvider";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Box, Container, Divider } from "@mui/material";
import { HandleRegister } from "./components/HandleRegister";
import { Notification } from "./components/Notification";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// analyticsはグラフを横に並べるため、他ページより広い最大幅を使う
const MAIN_MAX_WIDTH = { "/analytics": 900, default: 650 };

const MainContent = () => {
  const { pathname } = useLocation();
  const maxWidth = MAIN_MAX_WIDTH[pathname] || MAIN_MAX_WIDTH.default;

  return (
    <Box sx={{ width: "100%", maxWidth, mt: 2 }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/book" element={<BookSearch />} />
        <Route path="/" element={<Community />} />
        <Route path="/analytics" element={<ReadingAnalytics />} />
        <Route path="/information" element={<Information />} />
        <Route path="highlights" element={<Memo />} />
        <Route path="/postRegister" element={<PostRegister />} />
        <Route path="/:handle" element={<UserPage />} />
        <Route path="/handleRegister" element={<HandleRegister />} />
        <Route path="/notifications" element={<Notification />} />
      </Routes>
    </Box>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // データ種別ごとに短くしたい場合は各useQuery呼び出し側でstaleTimeを上書きする
      staleTime: 1000 * 60 * 5,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <Router>
          <ThemeModeProvider>
            <div className="App">
              <UserProvider>
                <ScrollToTop />
                <NotifyProvider>
                  <Box
                    sx={{
                      mx: "auto",
                      bgcolor: "background.paper",
                    }}
                  >
                    <Header />
                  </Box>
                  <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
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
                            sx={{ borderColor: "divider", alignSelf: "stretch" }}
                          />
                          <MainContent />
                        </Box>
                      </Box>
                    </Container>
                  </Box>
                </NotifyProvider>
              </UserProvider>
            </div>
          </ThemeModeProvider>
        </Router>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
