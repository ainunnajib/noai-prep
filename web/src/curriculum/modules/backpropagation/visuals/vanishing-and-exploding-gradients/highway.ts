/*
  Model for the residual-highway visual. It follows the lesson's formula exactly: each block's own
  layers have local derivative F′ = s, so going back through one block multiplies the gradient by
    plain block      y = F(x)         ∂y/∂x = F′ = s
    residual block   y = x + F(x)     ∂y/∂x = 1 + F′ = 1 + s
  After D blocks the gradient is s^D (plain) or (1 + s)^D (residual), which a learner can check by hand.
*/

export const MAX_BLOCKS = 30

/**
 * Size of the gradient arriving at each block and at the input, when the loss sends back a gradient of 1.
 * at[i] is the size arriving at the OUTPUT of block i (index 0 = the block nearest the input); atInput is
 * the size after passing back through block 0 as well.
 */
export function highwayNorms(depth: number, s: number, residual: boolean): { at: number[]; atInput: number; factor: number } {
  const factor = residual ? 1 + s : s
  const at = Array.from({ length: depth }, (_, i) => factor ** (depth - 1 - i))
  return { at, atInput: factor ** depth, factor }
}
