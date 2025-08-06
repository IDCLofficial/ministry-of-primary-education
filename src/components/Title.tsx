type TitleProps = {
    label: string;
}

export const Title = ({ label }: TitleProps) => {
    return(
        <h1 className="w-max text-xs sm:text-sm md:text-[14px] font-medium bg-white rounded-[2rem] px-3 sm:px-4 md:px-[1rem] py-1 sm:py-2 md:py-[0.5rem]">
            {label}
        </h1>
    )
}
