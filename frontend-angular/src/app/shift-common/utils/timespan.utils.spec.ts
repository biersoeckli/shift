import { TimeSpan, TimeSpanUtils } from './timespan.utils';

describe(TimeSpanUtils.name, () => {

  it('should return true because dates are overlapping', () => {
    const timeSpan1: TimeSpan = { start: new Date(2022, 1, 1, 9, 0), end: new Date(2022, 1, 1, 17, 0) };
    const timeSpan2: TimeSpan = { start: new Date(2022, 1, 1, 10, 0), end: new Date(2022, 1, 1, 16, 0) };
    expect(TimeSpanUtils.isOverlapping(timeSpan1, timeSpan2)).toBeTrue();
    expect(TimeSpanUtils.isOverlapping(timeSpan2, timeSpan1)).toBeTrue();
  });

  it('should return false because dates are not overlapping', () => {
    const timeSpan1: TimeSpan = { start: new Date(2022, 1, 1, 0, 0), end: new Date(2022, 1, 2, 0, 0) };
    const timeSpan2: TimeSpan = { start: new Date(2022, 1, 2, 0, 1), end: new Date(2022, 1, 3, 0, 0) };
    expect(TimeSpanUtils.isOverlapping(timeSpan1, timeSpan2)).toBeFalse();
    expect(TimeSpanUtils.isOverlapping(timeSpan2, timeSpan1)).toBeFalse();
  });
});
