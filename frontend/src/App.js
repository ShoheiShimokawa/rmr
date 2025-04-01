import logo from "./logo.svg";
import "./App.css";
import { BookList } from "./components/BookList";
import { UserBookShelf } from "./components/UserBookShelf";
import { Posts } from "./components/Posts";
import { BookSearch } from "./components/BookSearch";
import { MyPage } from "./components/MyPage";
import { PostRegister } from "./components/PostRegister";
import { ReadingAnalytics } from "./components/ReadingAnalytics";
import { Information } from "./components/Information";
import { UserPage } from "./components/UserPage";
import { Login } from "./components/Login";
import { Sidebar } from "./components/Sidebar";
import { UserProvider } from "./components/UserProvider";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";

function App() {
  return (
    <Router>
      <div className="App">
        <UserProvider>
          <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <Sidebar />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                ml: "200px", // Sidebar の幅を考慮
              }}
            >
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/book" element={<BookSearch />} />
                <Route path="/posts" element={<Posts />} />
                <Route path="/analytics" element={<ReadingAnalytics />} />
                <Route path="/information" element={<Information />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/postRegister" element={<PostRegister />} />
                <Route path="/userPage/:handle" element={<UserPage />} />
              </Routes>
            </Box>
          </Box>
        </UserProvider>
      </div>
    </Router>
  );
}

export default App;
