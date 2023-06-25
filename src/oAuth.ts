import { Provider, createClient } from '@supabase/supabase-js';

const supabaseUrl = "";
const supabaseKey = "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function oAuth(provider: Provider) {

    // try {
    //   const { data, error } = await supabase.auth.signInWithOAuth({
    //     provider: provider,
    //     options: {
    //       skipBrowserRedirect: false,
    //       redirectTo: 'http://localhost:3000/oauth/redirect'
    //     }
    //   });

    //   if (error) {
    //     console.error('Login error:', error.message);
    //     return error;
    //   }

    //   console.log(`${data} login successful`);
    //   return data;
    // } catch (error) {
    //   console.log(`Login error: ${error}`);
    //   return error;
    // }

    return null;
}