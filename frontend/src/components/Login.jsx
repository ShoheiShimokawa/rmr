import { GoogleLogin } from '@react-oauth/google';
import { Card, CardContent } from '@mui/material';
import { useNavigate } from "react-router-dom";
import UserContext from "./UserProvider"
import { useContext } from "react"

export const Login = () => {

    const navigate = useNavigate();
    const goToBookList = () => console.log("test"); navigate("/book");
    const { user, setUser } = useContext(UserContext);

    const handleLoginSuccess = async (response) => {
        const token = response.credential;
        try {
            const result = await fetch('http://localhost:8080/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });
            console.log(result)
            const userData = await result.json();
            console.log(userData.user)
            setUser(userData.user);
            console.log(typeof userData.user.userId)
            goToBookList();
        } catch (error) {
            console.error('Login failed', error);
        }
    }
    return (
        <div >
            <Card className="flex items-center  justify-center ">
                <CardContent >
                    <GoogleLogin className="mx-auto" width="200px" onSuccess={handleLoginSuccess} onError={() => console.log('Login Failed')} />
                </CardContent>
            </Card>
        </div>
    )
}