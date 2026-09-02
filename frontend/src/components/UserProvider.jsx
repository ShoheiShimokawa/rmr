import { useState, createContext, useEffect } from "react"

const UserContext = createContext();
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('token'));

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    // ログアウト、またはトークン失効時にまとめて認証状態をクリアする
    const logout = () => {
        setUser(null);
        setToken(null);
    };

    return (
        <UserContext.Provider value={{ user, setUser, token, setToken, logout }}>
            {children}
        </UserContext.Provider>
    );
}
export default UserContext;
