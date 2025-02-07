import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Slide,
} from '@mui/material';

// Slideのトランジションコンポーネント
const SlideTransition = React.forwardRef((props, ref) => (
    <Slide direction="left" ref={ref} {...props} />
));

export default function SlideDialogExample() {
    const [open, setOpen] = useState(false);
    const [showContent, setShowContent] = useState(true);
    const [animate, setAnimate] = useState(false); // 初回はfalseで設定

    const handleOpen = () => {
        setOpen(true);
        setAnimate(false); // 初回はアニメーションを無効化
    };

    const handleClose = () => {
        setOpen(false);
        setAnimate(false); // 閉じた際にアニメーションをリセット
    };

    // ボタンでshowContentの状態を切り替え
    const handleSlideContent = () => {
        setAnimate(true); // ボタン操作でアニメーションを有効化
        setShowContent(!showContent);
    };

    useEffect(() => {
        if (open) {
            setAnimate(false); // 初回表示ではアニメーションを無効化
        }
    }, [open]);

    return (
        <div>
            <Button variant="outlined" onClick={handleOpen}>
                Open Dialog
            </Button>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Slide Content Example</DialogTitle>

                <DialogContent>
                    {showContent ? (
                        <Slide in={showContent} direction="left" mountOnEnter unmountOnExit appear={animate}>
                            <div>
                                <p>Content 1: This is the first slide of content.</p>
                            </div>
                        </Slide>
                    ) : (
                        <Slide in={!showContent} direction="right" mountOnEnter unmountOnExit appear={animate}>
                            <div>
                                <p>Content 2: Here is the second slide of content.</p>
                            </div>
                        </Slide>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleSlideContent} color="primary">
                        {showContent ? 'Next' : 'Back'}
                    </Button>
                    <Button onClick={handleClose} color="secondary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
