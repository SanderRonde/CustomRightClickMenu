interface CRMStore<N extends CRM.Node = CRM.Node> extends 
	Map<CRM.NodeId<N>|CRM.GenericNodeId, N> {
		get<C extends CRM.Node>(key: CRM.NodeId<C>): C; 
		get(key: CRM.GenericNodeId): CRM.Node; 
}
interface SafeCRMStore<N extends CRM.SafeNode = CRM.SafeNode> 
	extends Map<CRM.NodeId<N>|CRM.GenericSafeNodeId, N> {
		get<C extends CRM.SafeNode>(key: CRM.NodeId<C>): C; 
		get(key: CRM.GenericSafeNodeId): CRM.SafeNode; 
}