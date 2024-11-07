import Modal from "../common/Modal";

interface DeleteModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	taskSlug: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	taskSlug,
}) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className='text-center'>
				<h3 className='text-lg font-medium mb-4'>Delete Task</h3>
				<p className='mb-6'>
					Are you sure you want to delete the task for collection{" "}
					<span className='font-semibold text-Brand/Brand-1'>{taskSlug}</span>?
					This action cannot be undone.
				</p>
				<div className='flex justify-center gap-4'>
					<button
						onClick={onClose}
						className='px-4 py-2 rounded-lg border border-Neutral/Neutral-Border-[night] hover:bg-Neutral/Neutral-300-[night] transition-colors'>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						className='px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors'>
						Delete
					</button>
				</div>
			</div>
		</Modal>
	);
};

export default DeleteModal;
