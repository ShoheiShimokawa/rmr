import { Alert, Fade, Stack } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';

const SuccessAlert = ({ show, message }) => {

    return (
        <div className="absolute top-4 right-3">
            {/* アラートをFadeでラップ */}
            <Fade in={show}>
                <Stack sx={{ width: '100%' }} spacing={2}>
                    <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
                        {message} 🎄
                    </Alert>
                </Stack>
            </Fade>
        </div>
    );
};

export default SuccessAlert;