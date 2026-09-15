const SIDE_CLASS: Record<'left' | 'right', string> = {
    left: '-left-[58px]',
    right: '-right-[58px]',
};

export const SLIDER_CLASS_NAME = (direction: 'left' | 'right') => {
    return `absolute ${SIDE_CLASS[direction]} top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-primary hover:bg-brand hover:text-white transition-colors duration-200 cursor-pointer shadow-md`
}