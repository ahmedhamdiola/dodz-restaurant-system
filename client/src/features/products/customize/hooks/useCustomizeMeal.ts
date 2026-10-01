import { useMemo, useReducer, useState } from "react";
import type { OptionGroup, QuantityMap, SelectionMap } from "../types";
import {
    activeGroups,
    canSelectMore,
    effectiveMax,
    effectiveMin,
    initialQuantities,
    initialSelection,
    isQuantityGroup,
    isSelected,
    pairTotal,
    priceDeltaTotal,
    quantityCount,
    selectedCount,
    selectedIDs,
    selectedQuantities,
    selectedValueIDs,
    stepQuantity,
    totalPickCount,
    validateGroups,
} from "../lib/selection";

interface State {
    selection: SelectionMap;
    quantities: QuantityMap;
    touched: ReadonlySet<number>;
}

type Action =
    | { type: "reset"; selection: SelectionMap; quantities: QuantityMap }
    | { type: "pickRadio"; groupID: number; valueID: number; clearable: boolean }
    | { type: "toggleCheck"; groupID: number; valueID: number; select: boolean; max: number }
    | { type: "step"; quantities: QuantityMap; groupID: number }
    | { type: "touch"; groupID: number };

const withTouch = (state: State, groupID: number): State =>
    state.touched.has(groupID)
        ? state
        : { ...state, touched: new Set(state.touched).add(groupID) };

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case "reset":
            return { selection: action.selection, quantities: action.quantities, touched: new Set() };
        case "pickRadio": {
            const current = state.selection[action.groupID] ?? [];
            // A required radio group is a true single-pick: re-tapping keeps it.
            // An optional one can be cleared, matching the server, which accepts
            // zero picks whenever min_selections is 0.
            if (current[0] === action.valueID) {
                if (!action.clearable || current.length === 0) return state;
                return {
                    selection: { ...state.selection, [action.groupID]: [] },
                    quantities: state.quantities,
                    touched: withTouch(state, action.groupID).touched,
                };
            }
            return {
                selection: { ...state.selection, [action.groupID]: [action.valueID] },
                quantities: state.quantities,
                touched: withTouch(state, action.groupID).touched,
            };
        }
        case "toggleCheck": {
            const current = state.selection[action.groupID] ?? [];
            const next = action.select
                ? current.includes(action.valueID) || current.length >= action.max
                    ? current
                    : [...current, action.valueID]
                : current.filter((id) => id !== action.valueID);
            if (next === current) return withTouch(state, action.groupID);
            return {
                selection: { ...state.selection, [action.groupID]: next },
                quantities: state.quantities,
                touched: withTouch(state, action.groupID).touched,
            };
        }
        case "step":
            return {
                selection: state.selection,
                quantities: action.quantities,
                touched: withTouch(state, action.groupID).touched,
            };
        case "touch":
            return withTouch(state, action.groupID);
    }
};

const initialState = (groups: OptionGroup[]): State => ({
    selection: initialSelection(groups),
    quantities: initialQuantities(groups),
    touched: new Set(),
});

/**
 * Selection + validation brain for the customize modal.
 *
 * `resetKey` is compared during render (the repo's "adjust state during a render"
 * pattern used by the cart drawer) so every reopen — and every product switch —
 * restarts from the admin's defaults without an effect-driven setState.
 */
export const useCustomizeMeal = (groups: OptionGroup[], resetKey: string) => {
    const visible = useMemo(() => activeGroups(groups), [groups]);
    const [state, dispatch] = useReducer(reducer, undefined, () => initialState(visible));

    const [prevKey, setPrevKey] = useState(resetKey);
    if (resetKey !== prevKey) {
        setPrevKey(resetKey);
        dispatch({
            type: "reset",
            selection: initialSelection(visible),
            quantities: initialQuantities(visible),
        });
    }

    const { selection, quantities, touched } = state;
    const errors = useMemo(() => validateGroups(visible, selection, quantities), [visible, selection, quantities]);
    const extras = useMemo(() => priceDeltaTotal(visible, selection, quantities), [visible, selection, quantities]);
    const valueIDs = useMemo(() => selectedValueIDs(visible, selection), [visible, selection]);
    const quantityList = useMemo(() => selectedQuantities(visible, quantities), [visible, quantities]);
    const pickCount = useMemo(() => totalPickCount(visible, selection), [visible, selection]);

    return {
        groups: visible,
        selection,
        quantities,
        errors,
        extras,
        valueIDs,
        quantityList,
        pickCount,
        isValid: Object.keys(errors).length === 0,
        idsFor: (group: OptionGroup) => selectedIDs(selection, group.id),
        countFor: (group: OptionGroup) => selectedCount(selection, group),
        has: (group: OptionGroup, valueID: number) => isSelected(selection, group.id, valueID),
        isTouched: (group: OptionGroup) => touched.has(group.id),
        /** Max reached, so further checkbox cards are visually closed off. */
        isSaturated: (group: OptionGroup) => !canSelectMore(selection, group),
        maxFor: (group: OptionGroup) => effectiveMax(group),
        pickRadio: (group: OptionGroup, valueID: number) =>
            dispatch({
                type: "pickRadio",
                groupID: group.id,
                valueID,
                clearable: effectiveMin(group) === 0,
            }),
        toggleCheck: (group: OptionGroup, valueID: number, select: boolean) =>
            dispatch({
                type: "toggleCheck",
                groupID: group.id,
                valueID,
                select,
                max: effectiveMax(group),
            }),
        /** Current count on one value of a counted group. */
        quantityOf: (valueID: number) => quantities[valueID] ?? 0,
        /** Current count across a whole counted group. */
        countInGroup: (group: OptionGroup) => quantityCount(quantities, group),
        totalFor: (group: OptionGroup) => pairTotal(group),
        isCounted: (group: OptionGroup) => isQuantityGroup(group),
        step: (group: OptionGroup, valueID: number, delta: number) =>
            dispatch({
                type: "step",
                quantities: stepQuantity(visible, quantities, group, valueID, delta),
                groupID: group.id,
            }),
        touch: (group: OptionGroup) => dispatch({ type: "touch", groupID: group.id }),
    };
};

export type CustomizeMeal = ReturnType<typeof useCustomizeMeal>;
