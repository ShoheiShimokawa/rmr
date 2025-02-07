import SuccessAlert from "./SuccessAlert"
import { useCallback, useState } from "react"

export const useMessage = () => {
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const showMessage = useCallback((message) => {
        setAlertMessage(message); // メッセージを設定
        setShowAlert(true); // アラートを表示
        setTimeout(() => {
            setShowAlert(false); // 3秒後に非表示
        }, 3000);
    }, []);

    const AlertComponent = (
        <SuccessAlert show={showAlert} message={alertMessage} />
    );

    return { showMessage, AlertComponent };
};