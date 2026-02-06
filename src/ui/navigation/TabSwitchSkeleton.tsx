import "./pageTabRail.css";

type TabSwitchSkeletonProps = {
  visible: boolean;
};

export function TabSwitchSkeleton({ visible }: TabSwitchSkeletonProps) {
  return (
    <div className="page-tab-rail__skeleton-wrapper">
      <div
        className="page-tab-rail__skeleton"
        data-visible={visible ? "true" : "false"}
        data-testid="tab-switch-skeleton"
        aria-hidden="true"
      />
    </div>
  );
}
