import { Icon } from "../Icon";
import { Text } from "../Text";
import type { StepperProps } from "./Stepper.type";
import clsx from "clsx";

const Stepper = ({
    id,
    style,
    className,
    steps,
    active,
    onStepperClick,
    hideLabels = false,
}: StepperProps) => {
    const activeIndex = steps?.findIndex((step) => step.key === active);

    return (
        <div id={id} style={style} className={clsx("pn-stepper", className)}>
            {steps?.map(({ key, title }, index) => {
                const isCompleted = index < activeIndex;
                const isActive = key === active;
                const isLast = index === (steps?.length ?? 0) - 1;

                return (
                    <div key={key ?? index} className="pn-stepper__item">
                        <div
                            className="pn-stepper__item-container"
                            onClick={() => onStepperClick?.(key)}
                        >
                            <div
                                className={clsx(
                                    "pn-stepper__item-circle",
                                    isCompleted &&
                                        "pn-stepper__item-circle--completed",
                                    isActive &&
                                        "pn-stepper__item-circle--active",
                                )}
                            >
                                {isCompleted ? (
                                    <Icon
                                        name="check"
                                        color="white"
                                        fontSize="lg"
                                    />
                                ) : (
                                    <Text
                                        size="sm"
                                        weight="medium"
                                        color={isActive ? "white" : "gray-500"}
                                    >
                                        {index + 1}
                                    </Text>
                                )}
                            </div>

                            <Text
                                color={
                                    isCompleted || isActive
                                        ? "primary"
                                        : "gray-500"
                                }
                                size="sm"
                                weight="medium"
                            >
                                {title}
                            </Text>
                        </div>

                        {!isLast && (
                            <Icon
                                name="arrow_forward_ios"
                                color={
                                    isCompleted || isActive
                                        ? "primary"
                                        : "gray-500"
                                }
                                fontSize="xl"
                                fontWeight="medium"
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default Stepper;
