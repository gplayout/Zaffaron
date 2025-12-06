
import html2canvas from 'html2canvas';

/**
 * Marketing Agent
 * Responsible for Viral Growth, Social Sharing, and Notifications.
 */
class MarketingAgent {
    constructor() {
        this.appName = "Zaffaron";
    }

    /**
     * Captures a DOM element as an image and triggers a download/share.
     * @param {HTMLElement} elementRef - The ref to the ShareCard component
     * @param {string} fileName - The name for the downloaded file
     */
    async generateShareImage(elementRef, fileName = 'recipe-share.png') {
        if (!elementRef.current) {
            console.error("MarketingAgent: Element ref is null");
            return false;
        }

        try {
            // Wait for images to load (heuristic)
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(elementRef.current, {
                useCORS: true, // Important for images
                scale: 2, // High resolution (Retina)
                backgroundColor: null, // Transparent bg if needed
                logging: false,
                width: 375, // Force Story Dimensions
                height: 667,
            });

            // Convert to blob
            canvas.toBlob(blob => {
                if (!blob) {
                    console.error("MarketingAgent: Canvas is empty");
                    return;
                }

                // Create file for Web Share API
                const file = new File([blob], fileName, { type: 'image/png' });

                // Use Web Share API if supported and can share files
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    navigator.share({
                        files: [file],
                        title: 'Check out this recipe!',
                        text: 'I found this amazing recipe on Zaffaron.',
                    }).catch(err => console.log('Share cancelled', err));
                } else {
                    // Fallback: Download
                    const link = document.createElement('a');
                    link.download = fileName;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                }
            }, 'image/png');

            return true;
        } catch (error) {
            console.error("MarketingAgent: Failed to generate image", error);
            return false;
        }
    }

    /**
     * Schedules a local notification (Future feature)
     */
    scheduleNotification(title, body, delaySeconds = 5) {
        if (!("Notification" in window)) return;

        if (Notification.permission === "granted") {
            setTimeout(() => {
                new Notification(title, { body, icon: '/pwa-192x192.png' });
            }, delaySeconds * 1000);
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    this.scheduleNotification(title, body, delaySeconds);
                }
            });
        }
    }
}

export const marketingAgent = new MarketingAgent();
