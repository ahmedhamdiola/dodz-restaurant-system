import { ArrowUpOnSquareIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom';
interface HeaderSectionProps {
    title: string,
    path: string,
}
const HeaderSection = ({ title, path }: HeaderSectionProps) => {
    const navigate = useNavigate();
    return (
        <div className="flex justify-between mr-10" onClick={() => navigate(path)}>
            <h1 className="font-bold text-nowrap text-2xl uppercase tracking-tighter text-secondary lg:ml-14 border-b-2 pb-1 border-red-600 w-fit">{title}</h1>
            <div className="flex gap-2 cursor-pointer items-center group">
                <ArrowUpOnSquareIcon className="w-6 text-muted-foreground rotate-90 group-hover:text-brand transition-colors" />
                <span className="text-md text-muted-foreground group-hover:text-brand transition-colors">See all</span>
            </div>
        </div>
    )
}

export default HeaderSection