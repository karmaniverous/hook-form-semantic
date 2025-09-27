export const checkIfDesktop = (setIsDesktop: (x: boolean) => void) => {
  const checkScreenSize = () => {
    setIsDesktop(window.innerWidth >= 768);
  };

  // Check on mount
  checkScreenSize();

  // Add event listener for window resize
  window.addEventListener('resize', checkScreenSize);

  // Cleanup
  return () => window.removeEventListener('resize', checkScreenSize);
};
