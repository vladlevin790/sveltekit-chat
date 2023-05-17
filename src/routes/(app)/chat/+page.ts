import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

//
//
// export const load: PageLoad = async ({ parent }) => {
// 	const { session, supabase } = await parent();
// 	if (!session) {
// 		throw redirect(303, '/');
// 	}
//
// 	const { data: testTable } = await supabase.from('test').select('*');
// 	return {
// 		testTable,
// 		user: session.user
// 	};
// };

export const load: PageLoad = async ({ parent }) => {
	const { session, supabase } = await parent();
	if (!session) {
		throw redirect(303, '/');
	}

	const { data: userChats } = await supabase.from('users').select('id');
	return {
		userChats,
		userus: session.user,
	};
};
