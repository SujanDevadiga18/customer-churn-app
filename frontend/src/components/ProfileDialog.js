import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Avatar,
    Divider,
    Grid,
    Chip
} from '@mui/material';
import {
    Email,
    Badge,
    VerifiedUser,
    CalendarToday,
    Logout
} from '@mui/icons-material';

export default function ProfileDialog({ open, onClose, user, onLogout }) {
    if (!user) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{
                sx: { borderRadius: 4, p: 1 }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3, mb: 2 }}>
                <Avatar
                    sx={{
                        width: 80,
                        height: 80,
                        bgcolor: 'primary.main',
                        fontSize: '2rem',
                        mb: 2,
                        boxShadow: 3
                    }}
                >
                    {user.username?.[0]?.toUpperCase()}
                </Avatar>
                <Typography variant="h5" fontWeight="bold">
                    {user.username}
                </Typography>
                <Chip
                    label={user.role || "User"}
                    size="small"
                    color={user.role === 'admin' ? "error" : "primary"}
                    variant="outlined"
                    sx={{ mt: 1 }}
                />
            </Box>

            <DialogContent>
                <Box sx={{ bgcolor: 'action.hover', p: 3, borderRadius: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Badge color="action" />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">User ID</Typography>
                                <Typography variant="body2" fontWeight="medium">#{user.id || "Unknown"}</Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <VerifiedUser color="success" />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">Account Status</Typography>
                                <Typography variant="body2" fontWeight="medium" color="success.main">Active • Verified</Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CalendarToday color="action" />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">Member Since</Typography>
                                <Typography variant="body2" fontWeight="medium">Jan 2026</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    startIcon={<Logout />}
                    onClick={onLogout}
                    sx={{ borderRadius: 2, py: 1.2 }}
                >
                    Sign Out
                </Button>
            </DialogActions>
        </Dialog>
    );
}
